import { promiseGet, promiseCreate, promiseUpdate } from "./dbService.mjs";
import passwordManagement from "../passwordManagement.mjs"
import mongodb from "mongodb";

const USERS = "users"; 
async function userValidation(query){ 
    //send db query to get user hashed password in return
    const user = await promiseGet(USERS,  { email : query.email });
    //compare the query password with the hashed db password
    return await passwordManagement.compareHash(query.password, user[0].password) ? user : false;
}

async function signUp(signUpInfo) {
  let isCreated = false
    await promiseGet(USERS, {email: signUpInfo.email}).then(async users => {
       if (users.length === 0){ //checks if there is no user with this mail in the db
        signUpInfo.password = await passwordManagement.passwordToHash(signUpInfo.password);
        signUpInfo.notifications = [];

        await promiseCreate(USERS, signUpInfo)
        isCreated = true
      }
    });
    return isCreated
}

async function getUsers(query) {
    if (typeof(query) === "string") {
      query = { _id : mongodb.ObjectID(query+"") }
    }
    return await (promiseGet(USERS, query));
};

async function saveNotification(roomId, type, userId) {
  const newNotification = {
      room: roomId,
      type: type
    };
  return await promiseUpdate(USERS, userId, {notifications: newNotification}, "push");    
}

async function deleteNotification(roomId, type, userId) {
  const notificaionToDelete = {
    room: roomId,
    type: type
  };
  return promiseUpdate(USERS, userId, {notifications: notificaionToDelete}, "pull");
}

export default {userValidation, signUp, getUsers, saveNotification, deleteNotification}
