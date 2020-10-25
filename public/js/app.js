const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');

// open request modal
requestLink.addEventListener('click', () => {
  requestModal.classList.add('open');
});

// close request modal
requestModal.addEventListener('click', (e) => {
  if (e.target.classList.contains('new-request')) {
    requestModal.classList.remove('open');
  }
});


//say hello function call
const button = document.querySelector('.call');
button.addEventListener('click',()=>{
    //get function reference
    const sayHello = firebase.functions().httpsCallable('sayHello');
    sayHello({name: 'pieter'}).then(result =>{
        console.log(result.data);
    });
})

//add a new request
//this function works but produces a 500 error due to node 8 upgrade to node 12
requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const addRequest = firebase.functions().httpsCallable('addRequest');

    console.log(requestForm.request.value);

   addRequest({
       text:requestForm.request.value
   }).then(() => {
        requestForm.reset();
        requestModal.classList.remove('open');
        requestForm.querySelector('.error').textContent = '';
   })
   .catch(error => {
       console.log(error)
       requestForm.querySelector('.error').textContent = error.message;
   })
});