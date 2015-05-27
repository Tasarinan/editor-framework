export ORIGINAL_PATH=`pwd`

# check if we have builtin
if [ ! -d "builtin" ]; then
    mkdir builtin
fi
cd builtin

# builtin panels
if [ ! -d "console" ]; then
    git clone https://github.com/fireball-x/console
fi

if [ ! -d "ipc-debugger" ]; then
    git clone https://github.com/fireball-x/ipc-debugger
fi

if [ ! -d "package-manager" ]; then
    git clone https://github.com/fireball-x/package-manager
fi

if [ ! -d "tester" ]; then
    git clone https://github.com/fireball-x/tester
fi

# builtin widgets
if [ ! -d "ui-kit" ]; then
    git clone https://github.com/fireball-x/ui-kit
fi

if [ ! -d "pixi-grid" ]; then
    git clone https://github.com/fireball-x/pixi-grid
fi

cd ${ORIGINAL_PATH}
