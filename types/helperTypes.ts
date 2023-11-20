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
    itemTranscription: string | null;
}
export interface UserDataArrayOfObj extends Array<UserData> {};
export interface SortableArray extends Array<string | UserData> {};

export interface MpChoices {
    item: string;
    itemTranscription: string | null;
}
export interface MpChoicesArrayOfObj extends Array<MpChoices> {};

export interface Question {
    question: string;
    qAnswer: string;
    id: string;
    mode: string;
    rule: string;
    level: string;
    fileUrl: string | null;
    all: MpChoicesArrayOfObj;
    splitted:  string[];
    itemTranscription: string | null;
    item: string;
};

export interface Report {
    correctAnswer: string;
    id: string;
    isCorrect: boolean;
    question: string;
    userAnswer: string;
    level: string;
    item: string;
};
export interface ReportArrayOfObj extends Array<Report> {};

export interface RecordUserAnswerDestructured {
    qAnswer: string;
    question: string;
    id: string;
    level: string;
    item: string;
};