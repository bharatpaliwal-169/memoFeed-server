import webpush from 'web-push';
export const postNotify = (req, res) => {
  try {
    const {subscription ,title,message} = req.body;
    const payload = JSON.stringify({ title, message });
    webpush.sendNotification(subscription, payload)
    .catch((err) => console.error("err", err));
    
    res.status(200).json({ success: true,title: title,message: message});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
  
}
