const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



// //http request 1
// exports.randomNumber = functions.https.onRequest((request,response) =>{

//     const number = Math.round(Math.random()*100);
//     response.send(number.toString());
// })


// //http request 2
// exports.tohpvk = functions.https.onRequest((request,response) =>{

//     response.redirect('https://hpvk.com');
// })

//http callable function
exports.sayHello = functions.https.onCall((data,context) =>{

    const name = data.name;
    return `hello, $(name)`;
})

//auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate(user => {
    console.log('user created', user.email,user.uid);
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn:[]
    })
})

//auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
    //console.log('user deleted', user.email,user.uid);
    const doc = admin.firestore().collection('users').doc(user.uid);
    doc.delete();
})


// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated', 
        'only authenticated users can add requests'
      );
    }
    if (data.text.length > 30) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'request must be no more than 30 characters long'
      );
    }
    return admin.firestore().collection('requests').add({
      text: data.text,
      upvotes: 0
    });
  });

// upvote callable function
// exports.upvote = functions.https.onCall((data, context) => {
//   // check auth state
//   if (!context.auth) {
//     throw new functions.https.HttpsError(
//       'unauthenticated', 
//       'only authenticated users can vote up requests'
//     );
//   }
//   // get refs for user doc & request doc
//   const user = admin.firestore().collection('users').doc(context.auth.uid);
//   const request = admin.firestore().collection('requests').doc(data.id);

//   return user.get().then(doc => {
//     // check thew user hasn't already upvoted
//     if(doc.data().upvotedOn.includes(data.id)){
//       throw new functions.https.HttpsError(
//         'failed-precondition', 
//         'You can only vote something up once'
//       );
//     }

//     // update the array in user document
//     return user.update({
//       upvotedOn: [...doc.data().upvotedOn, data.id]
//     })
//     .then(() => {
//       // update the votes on the request
//       return request.update({
//         upvotes: admin.firestore.FieldValue.increment(1)
//       });
//     });

//   });
// });

//convert to async await
// upvote callable function
exports.upvote = functions.https.onCall(async (data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated', 
      'only authenticated users can vote up requests'
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const request = admin.firestore().collection('requests').doc(data.id);

  const doc = await user.get();
  // check thew user hasn't already upvoted
  if(doc.data().upvotedOn.includes(data.id)){
    throw new functions.https.HttpsError(
      'failed-precondition', 
      'You can only vote something up once'
    );
  }

  // update the array in user document
  await user.update({
    upvotedOn: [...doc.data().upvotedOn, data.id]
  });
  
  // update the votes on the request
  return request.update({
    upvotes: admin.firestore.FieldValue.increment(1)
  });

});