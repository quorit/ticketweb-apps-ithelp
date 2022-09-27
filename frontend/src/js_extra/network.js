import {WebProjectError,HTTPResponseError} from "../js_extra/web_project_error.js"


class SessionAuthenticationError extends WebProjectError{
   constructor(message){
      super(message);
      this.name="SessionAuthenticationError"
   }
}




class NetworkError extends WebProjectError {
   //this is for when a fetch fails and we don't even get a response
   constructor(message){
      super(message);
      this.name="NetworkError"
   }
}

const config_data = JSON.parse(process.env.VUE_APP_CONFIG_DATA);





const init_data_url = window.location.origin + config_data.vue_app_path_roots.shared_data + "init_data.json";




function test_ok(response,session=false) {
    return new Promise ((resolve,reject) => {
       if (response.ok){
          resolve (response);
       }else{
         console.log("bye son");
         console.log(response);
         console.log(response.status);
         var str = "Server returned " + response.status + " : " + response.statusText;
         if (session){
            if (response.status){
               if (response.status==401){
                  //401 is HTTPUnauthorized but that really means not authenticated
                  //403 HTTPForbidden, is what really means unauthorized
                  reject(new SessionAuthenticationError(str));
               }else{
                  reject(new HTTPResponseError(response.status,str));
               }
            }else{
               new NetworkError("No response status. Probably no connection")
            }
         }else{
            reject(new HTTPResponseError(response.status,str));
         }
       }
    });
}


function extended_fetch(url,opts){
   return fetch(url,opts).then(response => response,err=> new NetworkError(err.message));
}

function fetch_init_data(){
   return extended_fetch(
      init_data_url, 
      {   
         method: "GET",
         mode: "cors"
      })
      .then(test_ok)
      .then(response => response.json());
   

}




const token_server_url = window.location.origin + config_data.vue_app_path_roots.authsystem + "session/reporting"


function get_app_token(){
   return extended_fetch(
         // should send cookie
         token_server_url, 
         {   
            method: "GET",
            mode: "cors"
         })
         .then(response => test_ok(response,true))
         .then(response => response.text());
         //response is just an application jwt token and we should have a renewed cookie
}




function login_session(user_id, password){
   const body = JSON.stringify({
      user_id: user_id,
      password: password
   })
   return extended_fetch(
      token_server_url, 
      {   
         method: "POST",
         mode: "cors",
         body: body
      })
      .then(response => test_ok(response,true))
      // eslint-disable-next-line no-unused-vars
      .then(response => true);
      //although there is no response body, we do get a cookie as part of the response
}


const api_root = window.location.origin + config_data.vue_app_path_roots.app_server;



function get_user_data(app_token){
   return extended_fetch(
      api_root + "user-data", 
      {   
         method: "GET",
         mode: "cors",
         headers: new Headers({
            "Authorization": "Bearer " + app_token,
         }),
      })
      .then(test_ok)
      .then(response => response.json());
}



function submit_data(submission_data,form_type,app_token){

   const api_url = api_root + "submit-ticket/" + form_type;
   console.log(api_url);
   return extended_fetch(
       api_url, 
       {   
          method: "POST",
          headers: new Headers({
            "Authorization": "Bearer " + app_token
          }),
          mode: "cors",
          body: submission_data
       }
    )
    .then(test_ok)
    .then(response => response.json());
}




function delete_session(){
   return extended_fetch(
      token_server_url,
      {
         method: "DELETE",
         mode: "cors"
      }
   ).then(response =>test_ok(response,true))
   // eslint-disable-next-line no-unused-vars
   .then(response => true);
}



export {submit_data, fetch_init_data, get_app_token, login_session, init_data_url,
        SessionAuthenticationError, NetworkError,get_user_data,delete_session,
      
      }