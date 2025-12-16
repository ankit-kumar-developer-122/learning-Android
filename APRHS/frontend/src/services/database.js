import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

// Enable PouchDB Find plugin
PouchDB.plugin(PouchDBFind)

// Initialize local databases
const visitsDB = new PouchDB('visits')
const patientsDB = new PouchDB('patients')

// Remote CouchDB configuration (for sync)
const REMOTE_URL = import.meta.env.VITE_COUCHDB_URL || 'http://localhost:5984'

class DatabaseService {
  constructor() {
    this.visitsDB = visitsDB
    this.patientsDB = patientsDB
    this.syncHandlers = []
  }

  // Initialize indexes for querying
  async initIndexes() {
    try {
      await this.visitsDB.createIndex({
        index: { fields: ['createdAt', 'synced'] }
      })
      await this.patientsDB.createIndex({
        index: { fields: ['name', 'village'] }
      })
      console.log('Database indexes created')
    } catch (error) {
      console.error('Error creating indexes:', error)
    }
  }

  // VISIT OPERATIONS

  async createVisit(visitData) {
    const visit = {
      _id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'visit',
      patientId: visitData.patientId,
      patientName: visitData.patientName,
      age: visitData.age,
      gender: visitData.gender,
      village: visitData.village,
      symptoms: visitData.symptoms || [],
      vitals: visitData.vitals || {},
      images: visitData.images || [],
      notes: visitData.notes || '',
      triageResult: null,
      visionResult: null,
      synced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: visitData.createdBy || 'VHW'
    }

    try {
      const result = await this.visitsDB.put(visit)
      return { ...visit, _rev: result.rev }
    } catch (error) {
      console.error('Error creating visit:', error)
      throw error
    }
  }

  async getVisit(id) {
    try {
      return await this.visitsDB.get(id)
    } catch (error) {
      console.error('Error getting visit:', error)
      throw error
    }
  }

  async updateVisit(id, updates) {
    try {
      const visit = await this.visitsDB.get(id)
      const updatedVisit = {
        ...visit,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const result = await this.visitsDB.put(updatedVisit)
      return { ...updatedVisit, _rev: result.rev }
    } catch (error) {
      console.error('Error updating visit:', error)
      throw error
    }
  }

  async getAllVisits() {
    try {
      const result = await this.visitsDB.allDocs({
        include_docs: true,
        descending: true
      })
      return result.rows.map(row => row.doc)
    } catch (error) {
      console.error('Error getting all visits:', error)
      throw error
    }
  }

  async getUnsyncedVisits() {
    try {
      const result = await this.visitsDB.find({
        selector: {
          synced: false
        },
        sort: [{ createdAt: 'desc' }]
      })
      return result.docs
    } catch (error) {
      console.error('Error getting unsynced visits:', error)
      throw error
    }
  }

  async deleteVisit(id) {
    try {
      const visit = await this.visitsDB.get(id)
      return await this.visitsDB.remove(visit)
    } catch (error) {
      console.error('Error deleting visit:', error)
      throw error
    }
  }

  // PATIENT OPERATIONS

  async createOrUpdatePatient(patientData) {
    const patientId = patientData.id || `patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const patient = {
      _id: patientId,
      type: 'patient',
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      village: patientData.village,
      phoneNumber: patientData.phoneNumber || '',
      address: patientData.address || '',
      createdAt: patientData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      // Try to get existing patient
      let existingPatient
      try {
        existingPatient = await this.patientsDB.get(patientId)
        patient._rev = existingPatient._rev
      } catch (e) {
        // Patient doesn't exist, will create new
      }

      const result = await this.patientsDB.put(patient)
      return { ...patient, _rev: result.rev }
    } catch (error) {
      console.error('Error creating/updating patient:', error)
      throw error
    }
  }

  async searchPatients(searchTerm) {
    try {
      const result = await this.patientsDB.allDocs({
        include_docs: true
      })
      
      const patients = result.rows.map(row => row.doc)
      
      if (!searchTerm) return patients
      
      const term = searchTerm.toLowerCase()
      return patients.filter(patient => 
        patient.name?.toLowerCase().includes(term) ||
        patient.village?.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error searching patients:', error)
      throw error
    }
  }

  // SYNC OPERATIONS

  async syncToRemote() {
    try {
      const remoteVisitsDB = new PouchDB(`${REMOTE_URL}/visits`)
      const remotePatientsDB = new PouchDB(`${REMOTE_URL}/patients`)

      // Sync visits
      const visitsSync = await this.visitsDB.sync(remoteVisitsDB, {
        live: false,
        retry: true
      })

      // Sync patients
      const patientsSync = await this.patientsDB.sync(remotePatientsDB, {
        live: false,
        retry: true
      })

      // Mark synced visits
      const unsyncedVisits = await this.getUnsyncedVisits()
      for (const visit of unsyncedVisits) {
        await this.updateVisit(visit._id, { synced: true })
      }

      console.log('Sync completed successfully')
      return {
        success: true,
        visitsSynced: visitsSync.push?.docs_written || 0,
        patientsSynced: patientsSync.push?.docs_written || 0
      }
    } catch (error) {
      console.error('Sync error:', error)
      throw error
    }
  }

  async setupLiveSync() {
    try {
      const remoteVisitsDB = new PouchDB(`${REMOTE_URL}/visits`)
      const remotePatientsDB = new PouchDB(`${REMOTE_URL}/patients`)

      // Live sync for visits
      const visitsSync = this.visitsDB.sync(remoteVisitsDB, {
        live: true,
        retry: true
      }).on('change', (info) => {
        console.log('Visits sync change:', info)
        this.notifySyncHandlers('visits', info)
      }).on('error', (err) => {
        console.error('Visits sync error:', err)
      })

      // Live sync for patients
      const patientsSync = this.patientsDB.sync(remotePatientsDB, {
        live: true,
        retry: true
      }).on('change', (info) => {
        console.log('Patients sync change:', info)
        this.notifySyncHandlers('patients', info)
      }).on('error', (err) => {
        console.error('Patients sync error:', err)
      })

      return { visitsSync, patientsSync }
    } catch (error) {
      console.error('Error setting up live sync:', error)
      throw error
    }
  }

  onSync(handler) {
    this.syncHandlers.push(handler)
  }

  notifySyncHandlers(type, info) {
    this.syncHandlers.forEach(handler => handler(type, info))
  }

  // STATISTICS

  async getStatistics() {
    try {
      const visits = await this.getAllVisits()
      const patients = await this.searchPatients('')
      const unsyncedVisits = await this.getUnsyncedVisits()

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayVisits = visits.filter(v => new Date(v.createdAt) >= today)

      return {
        totalVisits: visits.length,
        totalPatients: patients.length,
        unsyncedCount: unsyncedVisits.length,
        todayVisits: todayVisits.length
      }
    } catch (error) {
      console.error('Error getting statistics:', error)
      throw error
    }
  }
}

// Export singleton instance
const dbService = new DatabaseService()

// Initialize indexes on load
dbService.initIndexes()

export default dbService
