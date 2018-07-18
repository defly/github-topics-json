const fs = require('fs-extra');
const fm = require('front-matter');
const EXPLORE_PATH = `${__dirname}/../explore/topics`;
const fromTopicDir = async topic => {
  const contents = await fs.readFile(
    `${EXPLORE_PATH}/${topic}/index.md`,
    'utf8'
  );
  const { attributes, body } = fm(contents);
  for (const key of ['aliases', 'related']) {
    if (attributes[key]) {
      attributes[key] = attributes[key].split(',').map(s => s.trim());
    }
  }
  attributes.description = body.trim();
  return attributes;
};
const run = async () => {
  try {
    const exploreExists = await fs.pathExists(EXPLORE_PATH);
    if (!exploreExists) {
      throw new Error(
        'Please clone https://github.com/github/explore on upper directory level'
      );
    }
    const topicDirectories = await fs.readdir(EXPLORE_PATH);
    const topics = await Promise.all(topicDirectories.map(fromTopicDir));
    const json = JSON.stringify(topics, null, 2);
    await fs.ensureDir(`${__dirname}/dist/logos`);
    await fs.writeFile(`${__dirname}/dist/topics.json`, json);
    for (const topic of topics) {
      if (topic.logo) {
        await fs.copy(
          `${EXPLORE_PATH}/${topic.topic}/${topic.logo}`,
          `${__dirname}/dist/logos/${topic.logo}`
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
run();
