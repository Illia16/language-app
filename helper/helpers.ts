import { WordTranslation, WordTranslationArrayOfObj, SortableArray, Question } from 'types/helperTypes';

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

export const getLesson = (m:string, lessonData: WordTranslationArrayOfObj): WordTranslationArrayOfObj => {    
    return sortArray(lessonData) as WordTranslationArrayOfObj;
}

export const camelCaseString = (v: string):string => {
    // return v.replace(/\s(\w)/g, (match, letter) => letter.toUpperCase()).replace(/\s/g, '').toLowerCase();
    return v.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      }).replace(/\s+/g, '');
}

export const getQuestion = (m: string, lessonData: WordTranslationArrayOfObj, currentQuestionNum: number): Question => {    
    const handleQuestion = (m: string, lessonData: WordTranslationArrayOfObj, currentQuestionNum: number): Question => {        
        const questionAnswer = {} as Question;
        const q = lessonData[currentQuestionNum-1];

        console.log('q', q);
        
        questionAnswer.question = q[m === 'wordTranslation' || m === 'wordTranslationMPChoice' || m === 'sentenceWordTranslation' ? 'item' : 'itemCorrect'];
        questionAnswer.qAnswer = q[m === 'wordTranslation' || m === 'wordTranslationMPChoice' || m === 'sentenceWordTranslation' ? 'itemCorrect' : 'item'].replace(replaceAllinsideParantheses, '');
        
        questionAnswer.id = q.itemID;
        questionAnswer.mode = m;
        questionAnswer.rule = camelCaseString(q.itemTypeCategory);
        questionAnswer.level = q.level;
        questionAnswer.fileUrl = q.fileUrl;

        if (m === 'wordTranslationMPChoice') {            
            questionAnswer.all = fillMpChoiceArray(lessonData, q,  questionAnswer.qAnswer, 'itemCorrect');
        } else if (m === 'translationWordMPChoice') {
            questionAnswer.all = fillMpChoiceArray(lessonData, q,  questionAnswer.qAnswer, 'item');
        } else if (m === 'sentenceWordTranslation' || m === 'sentenceTranslationWord') {
            questionAnswer.splitted = sortArray(uniqueElements(questionAnswer.qAnswer.split(' '))) as string[];
        }

        console.log('questionAnswer', questionAnswer);
        return questionAnswer;
    }

    if (m !== 'random') {
        return handleQuestion(m, lessonData, currentQuestionNum);
    } else {
        const randomMode = getRandomMode(m);
        return handleQuestion(randomMode, lessonData, currentQuestionNum);
    }
}

// function to get a random mode
const getRandomMode = (mode: string):string => {
    const allModes: string[] = mode === 'words'
        ? ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice']
        : ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord'];
    const randomIndex:number = Math.floor(Math.random()*allModes.length);
    return allModes[randomIndex];
}

// function to produce 4 MP choices + include 1 correct answer
export const fillMpChoiceArray = (data: WordTranslationArrayOfObj, currentQuestion: WordTranslation, correctAnswer:string, mpChoiceType: string): string[] => {
    const wrongAnswersKey: string = mpChoiceType === 'itemCorrect' ? 'wrongAnswersMotherTongue' : 'wrongAnswers';
    let mpChoices: string[] = [];

    // check if data has incorrect answers array
    if (currentQuestion[wrongAnswersKey]) {
        mpChoices = currentQuestion[wrongAnswersKey] as string[];
    } else {        
        const randomMpChoices: string[] = data
            .map((el: WordTranslation, i: number): string => {
                    let res: string = '';
                    const q: string = el[mpChoiceType]?.replace(replaceAllinsideParantheses, '');
                
                    if (q !== correctAnswer) {
                        res = el[mpChoiceType] as string;
                    }
                                        
                    return res.replace(replaceAllinsideParantheses, '');
                })
            .filter(el=>el)
            .slice(0, 3);
        
        mpChoices = randomMpChoices;
    }

    mpChoices.push(correctAnswer);    
    return sortArray(mpChoices) as string[];
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
