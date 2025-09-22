//Kotlin is a statically typed programming language for modern multiplatform applications.

// Mutability in variables
var mutableString: String = "Adam"
val immutableString: String = "Adam"
val inferredString = "Adam"

// Numbers
val intNum = 10
val doubleNum = 10.0
val longNum = 10L
val floatNum = 10.0F

// Strings
val name = "Adam"
val greeting = "Hello, " + name
val greetingTemplate = "Hello, $name"
val interpolated = "Hello, ${name.toUpperCase()}"

// Booleans
val trueBoolean = true
val falseBoolean = false
val andCondition = trueBoolean && falseBoolean
val orCondition = trueBoolean || falseBoolean

// Static Fields
class Person {
    companion object {
        val NAME_KEY = "name_key"
    }
}

val key = Person.NAME_KEY

