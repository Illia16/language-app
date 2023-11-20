import { UserData, UserDataArrayOfObj, SortableArray, Question, MpChoices, MpChoicesArrayOfObj } from 'types/helperTypes';

// Replaced () and all what's inside with empty string so that the hint OR transcription is not included in the answer
const replaceAllinsideParantheses = new RegExp(/\s*\([^)]*\)/);

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
    // return v.replace(/\s(\w)/g, (match, letter) => letter.toUpperCase()).replace(/\s/g, '').toLowerCase();
    return v.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
}

export const getQuestion = (m: string, lessonData: UserDataArrayOfObj, currentQuestionNum: number): Question => {    
    const q = lessonData[currentQuestionNum-1];

    const handleQuestion = (m: string, lessonData: UserDataArrayOfObj): Question => {        
        const questionAnswer = {} as Question;

        console.log('q', q);
        
        questionAnswer.question = q[m === mapModes.wordTranslation || m === mapModes.wordTranslationMPChoice || m === mapModes.sentenceWordTranslation ? 'item' : 'itemCorrect'];
        questionAnswer.qAnswer = q[m === mapModes.wordTranslation || m === mapModes.wordTranslationMPChoice || m === mapModes.sentenceWordTranslation ? 'itemCorrect' : 'item'].replace(replaceAllinsideParantheses, '');
        
        questionAnswer.id = q.itemID;
        questionAnswer.mode = m;
        questionAnswer.rule = camelCaseString(q.itemTypeCategory);
        questionAnswer.level = q.level;
        questionAnswer.fileUrl = q.fileUrl;
        questionAnswer.itemTranscription = q.itemTranscription;

        if (m === mapModes.wordTranslationMPChoice) {            
            questionAnswer.all = fillMpChoiceArray(lessonData, questionAnswer.qAnswer, 'itemCorrect');
        } else if (m === mapModes.translationWordMPChoice) {
            questionAnswer.all = fillMpChoiceArray(lessonData, questionAnswer.qAnswer, 'item');
        } else if (m === mapModes.sentenceWordTranslation || m === mapModes.sentenceTranslationWord) {
            questionAnswer.splitted = sortArray(uniqueElements(questionAnswer.qAnswer.split(' '))) as string[];
        }

        console.log('questionAnswer', questionAnswer);
        return questionAnswer;
    }

    if (m !== mapModes.random) {
        return handleQuestion(m, lessonData);
    } else {
        // in Mandarin, there's no space between words ususally. Set different splitter.
        const isEligibleForSentence = q.languageStudying === 'zh' ? q.item.split("").length >= 2 : q.item.split(" ").length >= 3;
        const randomMode = getRandomMode(isEligibleForSentence);
        return handleQuestion(randomMode, lessonData);
    }
}

// function to get a random mode
const getRandomMode = (isEligibleForSentence: boolean):string => {
    const allModes: string[] = isEligibleForSentence ? 
        [mapModes.wordTranslation, mapModes.translationWord, mapModes.wordTranslationMPChoice, mapModes.translationWordMPChoice, mapModes.sentenceWordTranslation, mapModes.sentenceTranslationWord] :
        [mapModes.wordTranslation, mapModes.translationWord, mapModes.wordTranslationMPChoice, mapModes.translationWordMPChoice];
    const randomIndex:number = Math.floor(Math.random()*allModes.length);
    return allModes[randomIndex];
}

// function to produce 4 MP choices + include 1 correct answer
export const fillMpChoiceArray = (data: UserDataArrayOfObj, correctAnswer:string, mpChoiceType: string): MpChoicesArrayOfObj => {
    let correctitemTranscription: string | null = "";

    const mpChoices = data
        .map((el: UserData, i: number): MpChoices => {
            console.log('el', el);
            
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

export const isCorrect = (currentQuestion: Question, answer: string): boolean => {
    return answer.toLowerCase().trim() === currentQuestion.qAnswer.toLowerCase().trim();
}

// function outputs a lesson array for sentence-builder mode ONLY
// export const sentenceBuilderArr = (data) => {
//     return data.filter(el=>el.isSentense && el);
// }

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
    wordTranslation: 'wordTranslation',
    translationWord: 'translationWord',
    wordTranslationMPChoice: 'wordTranslationMPChoice',
    translationWordMPChoice: 'translationWordMPChoice',
    sentenceWordTranslation: 'sentenceWordTranslation',
    sentenceTranslationWord: 'sentenceTranslationWord',
    random: 'random',
}

export const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = (error) => reject(error);
    });
};
