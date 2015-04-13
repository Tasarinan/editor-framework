/**
 * This option is used to indicate that the message should not send to self.
 * It must be supplied as the last argument of your message if you want.
 */
Editor.selfExcluded = {
    '__is_ipc_option__': true,
    'self-excluded': true,
};

/**
 * This option is used to indicate that the message listener should receive a ipc event as its first argument.
 * It must be supplied as the last argument of your message if you want.
 */
Editor.requireIpcEvent = {
    '__is_ipc_option__': true,
    'require-ipc-event': true,
};

