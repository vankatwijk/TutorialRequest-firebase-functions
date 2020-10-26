var app = new Vue({
    el: '#app',
    data: {
      requests: []
    },
    mounted() {

        const ref = firebase.firestore().collection('requests');
        ref.onSnapshot(snapshot => {
            // console.log(snapshot);

            let requests = [];
            snapshot.forEach(doc => {
                requests.push({...doc.data(), id: doc.id});
            });
            // console.log(requests);
            this.requests = requests;
        });
    },
})
