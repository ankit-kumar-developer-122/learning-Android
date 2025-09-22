// 1. Primary Constructor
class Person(val name: String, val age: Int)
val adam = Person("Adam", 100)

// 2. Secondary Constructors
class Person(val name: String) {
    private var age: Int? = null

    constructor(name: String, age: Int) : this(name) {
        this.age = age
    }
}

// Above can be replaced with default params
class Person(val name: String, val age: Int? = null)

// 3. Inheritance & Implementation
open class Vehicle
class Car : Vehicle()

interface Runner {
    fun run()
}

class Machine : Runner {
    override fun run() {
        // ...
    }
}