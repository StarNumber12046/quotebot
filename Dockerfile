FROM node:22-bookworm
WORKDIR /app
RUN mkdir src assets dist
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY apps apps
COPY packages packages
COPY turbo.json .
COPY tsconfig.json .
COPY start-bot.sh .
RUN npm install -g pnpm
RUN pnpm install
RUN ls
RUN pnpm build
#ENTRYPOINT ["/bin/bash"]
ENTRYPOINT ["bash", "start-bot.sh"]