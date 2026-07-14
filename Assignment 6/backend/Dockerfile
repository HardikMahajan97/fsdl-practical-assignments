FROM node:20-alpine

# Install LaTeX (pdflatex) and dependencies
RUN apk add --no-cache \
    texlive \
    texlive-latex-extra \
    texmf-dist-latexextra \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads/letters uploads/raw logs

EXPOSE 5000

CMD ["node", "server.js"]
