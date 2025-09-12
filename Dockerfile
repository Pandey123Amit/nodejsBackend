FROM node

WORKDIR /rms

COPY package*.json ./

COPY . . 

RUN npm install

RUN npm run build

EXPOSE  5000

CMD ["npm","start"]
