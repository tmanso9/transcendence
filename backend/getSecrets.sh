#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists, create it if it doesn't
if [ ! -e .env ]; then
    touch .env
fi

# Function to get the value of a secret
get_secret_value() {
    secret_name="$1"
    vlt secrets get --plaintext "$secret_name"
}

# Run the vlt secrets list command and capture the output
secrets_output=$(vlt secrets list)

# Check if the command was successful
if [ $? -eq 0 ]; then
    # Parse the output and extract secret names
    secret_names=$(echo "$secrets_output" | awk 'NR > 1 {print $1}')

    # Declare an array to store secrets
    declare -a secrets_array

    # Loop through each secret and get its value
    while read -r secret_name; do
        secret_value=$(get_secret_value "$secret_name")

        # Check if the secret is already in .env
        if grep -q "^$secret_name=" .env; then
            echo -n -e "${RED}Secret $secret_name already exists in .env. Do you want to overwrite it? (y/n):${NC} "
            read -r answer < /dev/tty

            if [ "$answer" != "y" ]; then
                echo -e "Skipped overwriting secret $secret_name."
                continue
            else
                # Remove the existing line from .env
                sed -i -e "/^$secret_name=/d" .env
            fi
        fi

        # Check if getting the secret value was successful
        if [ $? -eq 0 ]; then
            # Store the secret in the array
            secrets_array+=("$secret_name=\"$secret_value\"")
            echo -e "$secret_name stored."
        else
            echo -e "${RED}Failed to get value for secret $secret_name.${NC}"
        fi
    done <<< "$secret_names"

    # Write the secrets in reverse order to .env file
    for ((i=${#secrets_array[@]}-1; i>=0; i--)); do
        echo "${secrets_array[i]}" >> .env
    done

    echo -e "${GREEN}Secrets written to .env file.${NC}"
else
    echo -e "${RED}Failed to retrieve secrets.${NC}"
fi
