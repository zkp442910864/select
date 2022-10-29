
import TreeSelect from './components/TreeSelect';
import ScrollBox from './components/ScrollBox';
// import {default as mockData} from './testData/data.json';

const mockData = () => {
    return import('./testData/data.json');
};

export {
    TreeSelect,
    ScrollBox,
    mockData,
};