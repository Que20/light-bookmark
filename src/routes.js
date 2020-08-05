let CryptoJS = require("crypto-js")
let router = require('express').Router()

router.post('/new/', function(req, res) {
    createBookmark(req, req.query.url, (success) => {
        res.status(200)
        res.send('OK')
    })
})

// router.get('/login/', function(req, res) {
//     presentLoginPage(res, '')
// })

router.get('/logout/', function(req, res) {
    req.session.token = null
    req.session.name = null
    req.session.id = null
    presentLoginPage(res, 'You are now logged out')
})

router.get('/app/', function(req, res) {
    if (req.session.token) {
        if (req.query.rm != null) {
            deleteBookmark(req.query.rm, (success) => {
                getBookmarks((bookmarks) => {
                    presentAppPage(req, res, bookmarks, '', '')
                })
            })
        } else {
            getBookmarks((bookmarks) => {
                presentAppPage(req, res, bookmarks, '', '')
            })
        }
    } else {
        presentLoginPage(res, '')
    }
})

router.post('/app/', function(req, res) {
    if (req.session.token) {
        if (req.body.url != null) {
            createBookmark(req, req.body.url, (success) => {
                getBookmarks((bookmarks) => {
                    console.log('> presenting page')
                    presentAppPage(req, res, bookmarks, '', req.body.url)
                })
            })
            return
        }
        if (req.body.search != null) {
            res.status(200)
            //res.render('app', { bookmarks: searchBookmark(req.body.search), search_req: req.body.search })
            return
        }
    } else {
        if (req.body.password != null && req.body.password != '') {
            login(req, req.body.login, req.body.password, (success) => {
                if (success) {
                    getBookmarks((bookmarks) => {
                        presentAppPage(req, res, bookmarks, '', '')
                    })
                } else {
                    presentLoginPage(res, 'Invalid login, try again')
                }
            })
        } else {
            presentLoginPage(res, 'All fields are required')
        }
    }
})

function presentAppPage(req, res, bookmarks, search_req, url_added) {
    let data = {
        bookmarks: bookmarks,
        search_req: search_req,
        added: url_added,
        token: req.session.token,
        name: req.session.name
    }
    res.status(200)
    res.render('app', data)
}

function presentLoginPage(res, message) {
    res.status(200)
    res.render('login', { message: message })
}

function deleteBookmark(id, callback) {
    Bookmark = require('./bookmarkModel')
    Bookmark.deleteOne({ _id: id }, function (err) {
        if (err) {
            console.log(err)
        }
        callback(true)
    })
}

function createBookmark(req, url, callback) {
    console.log('> creating')
    const urlMetadata = require('url-metadata')
    urlMetadata(url).then(
        function (metadata) {
            registerBookmark(req, metadata, (success) => {
                console.log('> registered')
                callback(success)
            })
        },
        function (error) {
            callback(false)
        }
    )
}

function registerBookmark(req, metadata, callback) {
    console.log('> registering')
    const Entities = require('html-entities').AllHtmlEntities
    const entities = new Entities()

    Bookmark = require('./bookmarkModel')
    var bookmark = new Bookmark()
    bookmark.url = metadata.url
    bookmark.title = entities.decode(metadata.title)
    bookmark.description = entities.decode(metadata.description)
    bookmark.date = Date.now()
    bookmark.owner = req.session.id

    bookmark.save(function (err) {
        if (err) {
            console.log(err)
            callback(false)
        } else {
            callback(true)
        }
    })
}

function login(req, login, password, callback) {
    User = require('./userModel')
    User.find({ name: login }, function (err, data) {
        if (err) {
            console.log(err)
        }
        if (data != null && (data[0].password == password)) {
            req.session.token = CryptoJS.SHA256(login + password).toString()
            req.session.name = login
            req.session.id = data[0]._id
            callback(true)
        } else {
            callback(false)
        }
    })
}

function getBookmarks(callback) {
    Bookmark = require('./bookmarkModel')
    Bookmark.find({}).sort({date: 'descending'}).exec(function(err, data) { 
        callback(data)
    })
}

function searchBookmark(value) {
    return [
        {url: "http://", title: "foo"},
        {url: "http://", title: "foo"}
    ]
}

module.exports = router 