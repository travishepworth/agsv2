#!/usr/bin/env bash

# Get the current volume level of a sink-input from command line flag
# After getting the level of the volume, we can call the ags function to display the volume level.

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <SINK_INPUT_ID>"
    exit 1
fi

SINK_INPUT_ID=$1
echo "SINK_INPUT_ID: $SINK_INPUT_ID"

# Get the current volume level of the sink-input
pactl_output=$(pactl list sink-inputs)
volume_level=$(echo "$pactl_output" | grep -A 15 "Sink Input #$SINK_INPUT_ID" | grep "Volume" | awk '{print $5}' | sed 's/%//g')
application_name=$(echo "$pactl_output" | grep -A 20 "Sink Input #$SINK_INPUT_ID" | grep "application.name" | awk '{print $3}' | sed 's/"//g' | tr '[:upper:]' '[:lower:]')

default_sink_names=("librewolf", "chromium", "spotify")

echo "Application name: $application_name"
echo "Volume level: $volume_level"

if [[ ! " ${default_sink_names[@]} " =~ " $application_name " ]]; then
  application_name="other"
fi

echo "Application name: $application_name"
ags request "$application_name:$volume_level"
