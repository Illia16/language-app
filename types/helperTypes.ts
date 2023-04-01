export interface WordTranslation {
    translation: string;
    word: string;
    id?: number;
    [key: string]: string|number|undefined; // id will be number in the future
};
export interface WordTranslationArrayOfObj extends Array<WordTranslation> {};

export interface SortableArray extends Array<string | WordTranslation> {};

export interface Question {
    all: string[];
    id: number | undefined; // id will be number in the future
    mode: string;
    qAnswer: string;
    question: string;
    splitted:  string[];
};

export interface InitData {
    data: WordTranslationArrayOfObj;
    name: string;
    nameTransladed: string;
    value: string;
};
export interface InitDataArrayOfObj extends Array<InitData> {};

export interface Report {
    correctAnswer: string;
    id: number | undefined; // id will be number in the future
    isCorrect: boolean;
    question: string;
    userAnswer: string;
};
export interface ReportArrayOfObj extends Array<Report> {};


export interface RecordUserAnswerDestructured {
    qAnswer: string;
    question: string;
    id?: number | undefined;
};