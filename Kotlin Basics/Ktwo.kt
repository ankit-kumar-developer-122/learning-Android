// Control Flow

// If statement
if (someBoolean) {
    doThing()
} else {
    doOtherThing()
}

// 2. When statementwhen (direction) {
    NORTH -> {
        print("North")
    }
    SOUTH -> print("South")
    EAST, WEST -> print("East or West")
    "N/A" -> print("Unavailable")
    else -> print("Invalid Direction")
}

// 3. For Loops
for (i in 0..10) { } // 1 - 10
for (i in 0 until 10) // 1 - 9
(0..10).forEach { }
for (i in 0 until 10 step 2) // 0, 2, 4, 6, 8

// 4. While Loops
while (x > 0) {
    x--
}

do {
    x--
} while (x > 0)

