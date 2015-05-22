#!/bin/bash

export ORIGINAL_PATH=`pwd`

for name in builtin/*
do
    if [ -d "${name}" ]; then
        echo ------------------------------------------
        echo ${name}
        echo ------------------------------------------

        cd ${name}

        # git status -s -b
        git status -s
        git cherry -v

        cd ${ORIGINAL_PATH}
        echo
    fi
done
