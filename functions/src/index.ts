import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

var serviceAccount = require('../gkey2.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://birthday-sender.firebaseio.com"
});

export const onNewPostCreated = functions.firestore.document('posts/{wildcard}').onCreate(async (snapshot, context) => {

    const showdown = await import('showdown');
    const jsdom = await import('jsdom');
    const uuid = await import('uuid');

    const converter = new showdown.Converter();

    const data = snapshot.data();

    if (!data?.content) {
        throw new Error('Empty content');
    }

    const newHtmlContent = converter.makeHtml(data.content);

    const JSDOM = jsdom.JSDOM;

    const DOM = new JSDOM(newHtmlContent);

    const allLinkTags = DOM.window.document.querySelectorAll('a');

    const externalLinks: any = [];

    const analyticsLinksDB = admin.firestore();

    allLinkTags.forEach(link => {
        const linkID = uuid.v4();

        externalLinks.push(
            analyticsLinksDB.collection('analytics_links').add({
                ID: linkID,
                pointTo: link.getAttribute('href'),
                createdAt: new Date(),
                originalPostID: snapshot.id,
            })
        );

        link.setAttribute('href', `https://us-central1-birthday-sender.cloudfunctions.net/URLanalytics?ID=${linkID}`);

    });

    await Promise.all(externalLinks);

    const newPostData = {
        ...data,
        processing: false,
        htmlContent: DOM.window.document.body.innerHTML
    };

    return snapshot.ref.set(newPostData, {
        merge: true,
    });

});

export const URLanalytics = functions.https.onRequest(async (req, res) => {
    const ID = req.query.ID;
    if (!ID) {
        res.end('Missing external link ID');
        return Promise.reject();
    }

    const db = admin.firestore();

    const snap = await db.collection('analytics_links').where('ID', '==', ID).limit(1).get();

    const data = snap.docs[0].data();

    if (!data) {
        res.end('Link ID Not Found');
        return Promise.reject('Link ID Not Found');
    }

    const pointTo = data.pointTo;
    res.redirect(pointTo);

    const setAnalyticsDataBatch = db.batch();

    // const docRef = db.doc(`analytics_links/${snap.docs[0].id}`)
    const docRef = db.collection('analytics_links').doc(snap.docs[0].id).collection('clicks').doc()


    setAnalyticsDataBatch.create(
        docRef,
        {
            clickTime: new Date(),
            headers: req.headers,
            ip_address: req.ip,
        }
    );

    setAnalyticsDataBatch.update(
        snap.docs[0].ref,
        {
            totalClicks: admin.firestore.FieldValue.increment(1),
        }
    )

    await setAnalyticsDataBatch.commit();

    return Promise.resolve();

});