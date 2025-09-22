// Collections#

// 1. Creation
val numArray = arrayOf(1, 2, 3)
val numList = listOf(1, 2, 3)
val mutableNumList = mutableListOf(1, 2, 3)

// 2. Accessing
val firstItem = numList[0]
val firstItem = numList.first()
val firstItem = numList.firstOrNull()

// 3. Maps
val faceCards = mutableMapOf("Jack" to 11, "Queen" to 12, "King" to 13)
val jackValue = faceCards["Jack"] // 11
faceCards["Ace"] = 1

// 4. Iterating
for (item in myList) {
    print(item)
}

myList.forEach {
    print(it)
}

myList.forEachIndexed { index, item -> 
    print("Item at $index is: $item")
}

// 5. Filtering & Searching
val evenNumbers = numList.filter { it % 2 == 0 }
val containsEven = numList.any { it % 2 == 0 }
val containsNoEvens = numList.none { it % 2 == 0 }
val containsNoEvens = numList.all { it % 2 == 1 }
val firstEvenNumber: Int = numList.first { it % 2 == 0 }
val firstEvenOrNull: Int? = numList.firstOrNull { it % 2 == 0 }
val fullMenu = objList.map { "${it.name} - $${it.detail}" }

//Note: it is the implicit name for a single parameter.

// 6. Mutability
val immutableList = listOf(1, 2, 3)
val mutableList = immutableList.toMutableList()

val immutableMap = mapOf("Jack" to 11, "Queen" to 12, "King" to 13)
val mutableMap = immutableMap.toMutableMap()