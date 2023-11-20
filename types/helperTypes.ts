export interface UserData {
    level: string;
    languageStudying: string;
    itemTypeCategory: string;
    user: string;
    itemType: string;
    languageMortherTongue: string;
    itemID: string;
    item: string;
    itemCorrect: string;
    filePath: string | null;
    fileUrl: string | null;
}

export interface ArrayOfUserData extends Array<UserData> {};

export interface WordTranslation {
    translation: string;
    word: string;
    rule: string;
    wrongAnswers?: string[];
    wrongAnswersMotherTongue?: string[];
    itemID: string;
    level: string;
    fileUrl: string | null;
    itemTypeCategory: string;
    // [key: string]: string|number|undefined|Array<string>;
};
export interface WordTranslationArrayOfObj extends Array<WordTranslation> {};

export interface SortableArray extends Array<string | WordTranslation> {};

export interface Question {
    all: string[];
    id: string;
    mode: string;
    qAnswer: string;
    question: string;
    splitted:  string[];
    rule: string;
    level: string;
    fileUrl: string | null;
};

export interface InitData {
    data: WordTranslationArrayOfObj;
    name: string;
    nameTransladed: string;
    val: string;
};
export interface InitDataArrayOfObj extends Array<InitData> {};

export interface Report {
    correctAnswer: string;
    id: string;
    isCorrect: boolean;
    question: string;
    userAnswer: string;
    level: string; 
};
export interface ReportArrayOfObj extends Array<Report> {};

export interface RecordUserAnswerDestructured {
    qAnswer: string;
    question: string;
    id: string;
    level: string;
};