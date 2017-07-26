import Cookies from 'universal-cookie';
import $ from 'jquery';
import ChatAppDispatcher from '../dispatcher/ChatAppDispatcher';
import ChatConstants from '../constants/ChatConstants';
import UserPreferencesStore from '../stores/UserPreferencesStore';
import MessageStore from '../stores/MessageStore';

const cookies = new Cookies();

let ActionTypes = ChatConstants.ActionTypes;


export function getHistory(initialCall, prevMessageCount) {
  if(prevMessageCount === null || prevMessageCount === undefined){
    prevMessageCount = 0;
  }
  let BASE_URL = '';
  let defaults = UserPreferencesStore.getPreferences();
  let defaultServerURL = defaults.Server;

  if(cookies.get('serverUrl')===defaultServerURL||
    cookies.get('serverUrl')===null||
    cookies.get('serverUrl')=== undefined){
    BASE_URL = defaultServerURL;
  }
  else{
    BASE_URL= cookies.get('serverUrl');
  }

  let url = '';
  if(cookies.get('loggedIn')===null||
    cookies.get('loggedIn')===undefined){
    url = BASE_URL+'/susi/memory.json?cognitions=5';
  }
  else{
    url = BASE_URL+'/susi/memory.json?cognitions=5&access_token='+cookies.get('loggedIn');
  }

  let historyMeta = MessageStore.getHistoryMeta();
  if(historyMeta.cognitions_remaining !== null){
    if(historyMeta.cognitions_remaining === 0){
      return;
    }
    else if (historyMeta.last_msg_date === null) {
      return;
    }
    else {
      let lastMsgDate = historyMeta.last_msg_date;
      url += '&date='+lastMsgDate;
    }
  }

  console.log(url);
  $.ajax({
    url: url,
    dataType: 'jsonp',
    crossDomain: true,
    timeout: 3000,
    async: false,
    success: function (history) {
      console.log(history);
      let cogLength = history.cognitions.length;
      if(cogLength === 0){
        return;
      }
      console.log(initialCall);
      if(!initialCall){
        history.cognitions.splice(0,1);
        cogLength = history.cognitions.length;
      }
      let historyMetaData = {
        cognitions_remaining: history.cognitions_remaining,
        last_msg_date: history.cognitions[cogLength-1].query_date,
        prevMessageCount: prevMessageCount,
        cognitions_added: cogLength,
      }

      ChatAppDispatcher.dispatch({
        type: ActionTypes.STORE_HISTORY_META,
        historyMetaData
      });

      history.cognitions[cogLength-1].lastCog = true;

      history.cognitions.forEach((cognition) => {

        let susiMsg = {
          id: 'm_',
          threadID: 't_1',
          authorName: 'SUSI', // hard coded for the example
          text: '',
          response: {},
          actions: [],
          websearchresults: [],
          date: '',
          isRead: true,
          type: 'message',
          lang: 'en-US',
          feedback: {
              isRated: true,
              rating: null,
            }
        };

        let userMsg = {
          id: 'm_',
          threadID: 't_1',
          authorName: 'You',
          date: '',
          text: '',
          isRead: true,
          type: 'message'
        };

        let query = cognition.query;

        userMsg.id = 'm_' + Date.parse(cognition.query_date);
        userMsg.date = new Date(cognition.query_date);
        userMsg.text = query;

        susiMsg.id = 'm_' + Date.parse(cognition.answer_date);
        susiMsg.date = new Date(cognition.answer_date);
        susiMsg.text = cognition.answers[0].actions[0].expression;
        susiMsg.response = cognition;

        let actions = [];
        cognition.answers[0].actions.forEach((actionObj) => {
          actions.push(actionObj.type);
        });
        susiMsg.actions = actions;

        if (actions.indexOf('websearch') >= 0) {
          $.ajax({
            url: 'http://api.duckduckgo.com/?format=json&q=' + query,
            dataType: 'jsonp',
            crossDomain: true,
            timeout: 3000,
            async: false,
            success: function (data) {
              susiMsg.websearchresults = data.RelatedTopics;
              if (data.AbstractText) {
                let abstractTile = {
                  Text: '',
                  FirstURL: '',
                  Icon: { URL: '' },
                }
                abstractTile.Text = data.AbstractText;
                abstractTile.FirstURL = data.AbstractURL;
                abstractTile.Icon.URL = data.Image;
                susiMsg.websearchresults.unshift(abstractTile);
              }
            },
            error: function(xhr, status, error) {
              if (status === 'timeout') {
                console.log('Please check your internet connection');
              }
            }
          });
        }

        let message = userMsg;
        ChatAppDispatcher.dispatch({
          type: ActionTypes.STORE_HISTORY_MESSAGE,
          message
        });

        message = susiMsg;
        ChatAppDispatcher.dispatch({
          type: ActionTypes.STORE_HISTORY_MESSAGE,
          message
        });
      });
    },
    error: function(xhr, status, error) {
         if (status === 'timeout') {
                console.log('Please check your internet connection');
        }
    }
  });
}
