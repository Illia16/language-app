import { type UserData, type UserDataArrayOfObj, type SortableArray, type Question, type MpChoices, type MpChoicesArrayOfObj } from 'types/helperTypes';

// Replaced () and all what's inside with empty string so that the hint OR transcription is not included in the answer
const replaceAllinsideParantheses = new RegExp(/\s*\([^)]*\)/);
const replaceAllSpecialCharsEngZh = new RegExp(/[,\.\s!\?;:\|\/。、，！？：-；]/g);

export const sortArray = (arr: SortableArray): SortableArray => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    return arr;
};

export const getLesson = (m:string, lessonData: UserDataArrayOfObj): UserDataArrayOfObj => {    
    return sortArray(lessonData) as UserDataArrayOfObj;
}

export const camelCaseString = (v: string):string => {
    return v.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
}

export const getQuestion = (m: string, lessonData: UserDataArrayOfObj, currentQuestionNum: number): Question => {
    const q = lessonData[currentQuestionNum-1] as UserData;

    const handleQuestion = (m: string, lessonData: UserDataArrayOfObj): Question => {
        const questionAnswer = {} as Question;
        // diff splitter for Eng and Mandarin since the latter doesn't have spaces in sentences
        const splitter = (q.languageStudying === 'zh' && m === mapModes.sentenceTranslationWord
                        || q.userMotherTongue === 'zh' && m === mapModes.sentenceWordTranslation)
                         ? '' : ' ';

        questionAnswer.question = q[m === mapModes.wordTranslation || m === mapModes.wordTranslationMPChoice || m === mapModes.sentenceWordTranslation ? 'item' : 'itemCorrect'];
        questionAnswer.qAnswer = q[m === mapModes.wordTranslation || m === mapModes.wordTranslationMPChoice || m === mapModes.sentenceWordTranslation ? 'itemCorrect' : 'item'].replace(replaceAllinsideParantheses, '');

        questionAnswer.id = q.itemID;
        questionAnswer.mode = m;
        questionAnswer.rule = camelCaseString(q.itemTypeCategory);
        questionAnswer.level = q.level;
        questionAnswer.fileUrl = q.fileUrl;
        questionAnswer.item = q.item;
        questionAnswer.itemTranscription = q.itemTranscription;

        if (m === mapModes.wordTranslationMPChoice) {
            questionAnswer.all = fillMpChoiceArray(lessonData, questionAnswer.qAnswer, 'itemCorrect');
        } else if (m === mapModes.translationWordMPChoice) {
            questionAnswer.all = fillMpChoiceArray(lessonData, questionAnswer.qAnswer, 'item');
        } else if (m === mapModes.sentenceWordTranslation || m === mapModes.sentenceTranslationWord) {
            questionAnswer.splitted = sortArray(uniqueElements(questionAnswer.qAnswer.split(splitter))) as string[];
        }

        return questionAnswer;
    }

    if (m !== mapModes.random) {
        return handleQuestion(m, lessonData);
    } else {
        // in Mandarin, there's no space between words ususally. Set different splitter.
        const isEligibleForSentence = q.languageStudying === 'zh' ? q.item.split("").length >= 2 : q.item.split(" ").length >= 3;
        const hasAudioFile = q.filePath && q.fileUrl ? true : false;
        const randomMode = getRandomMode(isEligibleForSentence, hasAudioFile);

        return handleQuestion(randomMode, lessonData);
    }
}

// function to get a random mode
const getRandomMode = (isEligibleForSentence: boolean, hasAudioFile: boolean):string => {
    const allModes: string[] = [
        hasAudioFile && mapModes.wordListening,
        mapModes.wordTranslation,
        mapModes.translationWord,
        mapModes.wordTranslationMPChoice,
        mapModes.translationWordMPChoice,
        isEligibleForSentence && mapModes.sentenceWordTranslation,
        isEligibleForSentence && mapModes.sentenceTranslationWord
    ]
    .filter(el=>el)
    const randomIndex:number = Math.floor(Math.random()*allModes.length);
    return allModes[randomIndex];
}

// function to produce 4 MP choices + include 1 correct answer
export const fillMpChoiceArray = (data: UserDataArrayOfObj, correctAnswer:string, mpChoiceType: string): MpChoicesArrayOfObj => {
    let correctitemTranscription: string | null = "";

    // check if there's predefined incorrect options
    const hasIncorrectOptions: UserData = data.filter(el => el[mpChoiceType]?.replace(replaceAllinsideParantheses, '') === correctAnswer && el?.incorrectItems?.length)[0];

    if (hasIncorrectOptions?.incorrectItems?.length && mpChoiceType === 'item') {
        const mpChoices = hasIncorrectOptions.incorrectItems
            .map((el: string): MpChoices => {
                return {
                    item: el,
                    itemTranscription: null,
                };
            })
        mpChoices.push({item: correctAnswer, itemTranscription: hasIncorrectOptions?.itemTranscription});
        return sortArray(mpChoices) as MpChoicesArrayOfObj;
    } else {
        const mpChoices = data
            .map((el: UserData, i: number): MpChoices => {

                let res: MpChoices = {} as MpChoices;
                const q: string = el[mpChoiceType]?.replace(replaceAllinsideParantheses, '');
                if (q !== correctAnswer) {
                    res = {
                        item: el[mpChoiceType].replace(replaceAllinsideParantheses, ''),
                        itemTranscription: el?.itemTranscription,
                    };
                } else {
                    correctitemTranscription = el?.itemTranscription;
                }

                return res;
            })
            .filter(el=>el.item)
            .slice(0, 3);

        mpChoices.push({item: correctAnswer, itemTranscription: correctitemTranscription});
        return sortArray(mpChoices) as MpChoicesArrayOfObj;
    }
}

export const isCorrect = (currentQuestion: Question, answer: string): boolean => {
    return answer.toLowerCase().replace(replaceAllSpecialCharsEngZh, '').trim() === currentQuestion.qAnswer.toLowerCase().replace(replaceAllSpecialCharsEngZh, '').trim();
}

// this function returns an array of letters that only repeat once
const uniqueElements = (array: string[]): string[] => {
    return [...new Set(array)];
}

export const mapLanguage = (v:string):string => {
    switch (v) {
        case 'ru':
            return 'Русский'
        case 'zh':
            return '中文'
        default:
            return 'English'
    }
}

export const mapModes = {
    wordListening: 'wordListening',
    wordTranslation: 'wordTranslation',
    translationWord: 'translationWord',
    wordTranslationMPChoice: 'wordTranslationMPChoice',
    translationWordMPChoice: 'translationWordMPChoice',
    sentenceWordTranslation: 'sentenceWordTranslation',
    sentenceTranslationWord: 'sentenceTranslationWord',
    random: 'random',
}

export const detectLanguage = (v: string): string => {
    // extend if needed
    if (/[\u4e00-\u9fff]/.test(v)) {
        return 'zh';
    }
    return 'other';
}
