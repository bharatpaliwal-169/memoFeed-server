const verifyEmail = (TOKEN) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-aFq/bzH65dt+w6FI2ooMVUpc+21e0SRygnTpmBvdBgSdnuTN7QbdgL+OapgHtvPp" crossorigin="anonymous"></link>
    <title>AuthDirect</title>
  </head>
  <body>
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-10 text-center justify-center">
          <h1 class="display-5" style="color:#09779A;font-weight:700">MemoFeed</h1>
          <p class="">Please click on the below link to verify your email.</p>
          <a href="http://localhost:5000/auth/verification/?token=${TOKEN}" class="text-bg-primary link-underline">verify my email</a>
        </div>
      </div>
      <div class="row">
        <h5 class="text-muted">This application is developed by 
          <a href="https://github.com/bharatpaliwal-169" class="link-underline-info">Bharat Paliwal</a>
        </h5>
      </div>
    </div>
  </body>
  </html>
  `
}

export default verifyEmail;