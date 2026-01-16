#!/usr/bin/env python3

# Import the function to be tested from the lab2practice module
from lab2practice import sum_squares_of_first_10_integers

# Call the function and store the result
result = sum_squares_of_first_10_integers()

# Print the result for verification
print(f"The sum of squares of the first 10 integers is: {result}")

# Assert that the result matches the expected value (1^2 + ... + 10^2 = 385)
assert result == 385, f"Expected 385, got {result}"

# If the assertion passes, print success message
print("Test passed!")