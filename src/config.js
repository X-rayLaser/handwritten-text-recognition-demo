const hostName = "localhost";

const port = 8080;

const schema = "http";

export const baseUrl = `${schema}://${hostName}:${port}`;

export const dataInfoPath = 'blstm/data_info.json';

export const dataInfoUrl = `${baseUrl}/${dataInfoPath}`;

export const wordIndexUrl = dictionarySize => {
    return `${baseUrl}/word_indices/${dictionarySize}/words.txt`;
};

export const tsjsModelUrl = `${baseUrl}/blstm/model.json`;

export const testExampleUrl = `${baseUrl}/blstm/test_example.json`;
