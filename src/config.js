const hostName = "localhost";

const port = 8080;

const schema = "http";

const baseUrl = `${schema}://${hostName}:${port}`;

export const dataInfoUrl = `${baseUrl}/blstm/data_info.json`;

export const wordIndexUrl = (location, fileName) => {
    return `${baseUrl}/word_indices/${location}/${fileName}`;
};

export const tsjsModelUrl = `${baseUrl}/blstm/model.json`;

export const testExampleUrl = `${baseUrl}/blstm/test_example.json`;
