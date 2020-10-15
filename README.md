# Blog Service of my personal website

## Installation

You can simply clone the repository and run the service by executing the
following commands.

```shell
git clone https://github.com/Kluddizz/personal-blog-service
cd personal-blog-service
npm install && npm start
```

This service uses another service to validate, if the requesting user is allowed
to visit and manipulate data. Therefore you have to get the public key used for
validating the users token (`RS256` encryption, JWT). Store the public key in
the root directory and name it `verify.key`. Every valid token has access to
all features of this service.
