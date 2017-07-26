import keyMirror from 'keymirror';

export default {

  ActionTypes: keyMirror({
    CLICK_THREAD: null,
    CREATE_MESSAGE: null,
    RECEIVE_RAW_CREATED_MESSAGE: null,
    CREATE_SUSI_MESSAGE: null,
    RECEIVE_SUSI_MESSAGE: null,
    RECEIVE_RAW_MESSAGES: null,
    STORE_HISTORY_MESSAGE: null,
    STORE_HISTORY_META: null,
    SERVER_CHANGED: null,
    INIT_SETTINGS: null,
    SETTINGS_CHANGED: null,
    RESET_MESSAGE_VOICE: null,
    FEEDBACK_RECEIVED: null,
  })

};
