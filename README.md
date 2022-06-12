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
on Heroku