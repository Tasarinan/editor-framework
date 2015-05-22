#!/bin/bash

export ORIGINAL_PATH=`pwd`

for name in builtin/*
do
    if [ -d "${name}" ]; then
        echo ------------------------------------------
        echo ${name}
        echo ------------------------------------------

        cd ${name}

        # check if we have uncommit changes
        result=$(git cherry -v)
        if [ ! "${result}" == "" ]; then
            git push $@
        fi

        cd ${ORIGINAL_PATH}
        echo
    fi
done
