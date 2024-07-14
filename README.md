# MemoFeed - A Social Media Full Stack Application

### #issue_0 : mongoo.set().
this line crashes the code : issue
mongoose.set('useFindAndModify', false);

it is depricated and is no longer required.

### #issue_1 : selectedFile was not appearing in the DB.
used var instead of const. (look into the issues for more information)

```
//updates
    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

//delete
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostMessage.findByIdAndRemove(id);
//likes
    const updatedCurrPost = await PostMessage.findByIdAndUpdate(id , 
            {likeCount: currPost.likeCount + 1},{new:true});
```

Deployed using -> paliwalBdev
on Heroku ->https://memofeedbackend.herokuapp.com/

## UPDATE
Heroku migration (due to end of Free service)
on OnRender -> https://memofeed-backend.onrender.com/ 

#### Testing(DROP)
Using JEST
firstly, install jest as devDeps.
then make config.
then describe a test case.
run.



## Major Code Updates:

1) removed body-parser(depreciated),node-cron, jest,supertest, redis.
2) app basic setup update
3) added a new logger service : winston
4) email templates updated.


## Features in PIPELINE:
1) input sanitze and restriction
2) UI changes
3) User Activity logs.
4) Notifications
5) Security and long signin with cookies.
