FROM node:22-bookworm
WORKDIR /app
RUN mkdir src assets dist
COPY src src
COPY tsconfig.json .
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
RUN npm install -g pnpm
RUN pnpm install
RUN ls
RUN pnpm build
#ENTRYPOINT ["/bin/bash"]
ENTRYPOINT ["bash", "start-bot.sh"]