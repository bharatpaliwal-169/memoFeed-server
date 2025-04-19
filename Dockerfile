# pull a base image
FROM node:23-alpine

# setup a default working dir in container
WORKDIR /base/app/

# copy config or package.json
COPY package.json /base/app/

# install the app deps
RUN npm install

COPY . /base/app/

CMD ["npm","start"]