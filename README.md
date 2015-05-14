# nodejs-socialauthenticator-demo
A complete node.js 3rd-party login app.
- User can sign in and connect to LinkedIn, Facebook, Google and Twitter using `passport`
- User can view the last 20 posts on their aggregated timeline
- The current signed in user will be persisted across server restarts
- In the home timeline, user can view posts with the user profile picture, username, content, origin social network and timestamp. In other words, data presentation should appear consistent for posts across social network sources.
- In the timeline, user can like and unlike posts.
- User can click share in the timeline, and share with a custom message on a separate page.
- User can click reply in the timeline, and submit a reply on a separate page.
- User can click compose anywhere, and submit a new post on a separate page.
- When composing, user can select to which networks to post.
- Optional: User can click a post and view it on a separate page with controls to share, like, and reply.
- Optional: User should be able to unshare their posts.
- Optional: User should be able to delete their posts.
- Optional: Replies should be prefixed with the username and link to the conversation thread.
- Optional: User can click a "Next" button at the bottom to load more 

## Dropbox [(raw)](https://gist.github.com/CrabDude/040af9c1b93e350608ff/raw)

This is a basic Dropbox clone to sync files across multiple remote folders.

Time spent: `<Number of hours spent>`

### Features

#### Required

- [ ] Client can make GET requests to get file or directory contents
- [ ] Client can make HEAD request to get just the GET headers 
- [ ] Client can make PUT requests to create new directories and files with content
- [ ] Client can make POST requests to update the contents of a file
- [ ] Client can make DELETE requests to delete files and folders
- [ ] Server will serve from `--dir` or cwd as root
- [ ] Client will sync from server over TCP to cwd or CLI `dir` argument

### Optional

- [ ] Client and User will be redirected from HTTP to HTTPS
- [ ] Server will sync from client over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can download a directory as an archive
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client


### Walkthrough

![Video Walkthrough](...)



