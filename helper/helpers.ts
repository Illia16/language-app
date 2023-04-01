import { WordTranslation, WordTranslationArrayOfObj, SortableArray, Question } from 'types/helperTypes';

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

export const getQuestion = (m: string, lessonData: WordTranslationArrayOfObj, currentQuestionNum: number, lessonType: string): Question => {

    const handleQuestion = (m: string, lessonData: WordTranslationArrayOfObj, currentQuestionNum: number): Question => {
        const questionAnswer = {} as Question;
        const q = lessonData[currentQuestionNum-1];     
        
        questionAnswer.question = q[m === 'wordTranslation' || m === 'wordTranslationMPChoice' || m === 'sentenceWordTranslation' ? 'word' : 'translation'];
        questionAnswer.qAnswer = q[m === 'wordTranslation' || m === 'wordTranslationMPChoice' || m === 'sentenceWordTranslation' ? 'translation' : 'word'];
        questionAnswer.id = q.id;
        questionAnswer.mode = m;

        if (m === 'wordTranslationMPChoice') {
            questionAnswer.all = fillMpChoiceArray(lessonData,  questionAnswer.qAnswer, 'translation');
        } else if (m === 'translationWordMPChoice') {
            questionAnswer.all = fillMpChoiceArray(lessonData,  questionAnswer.qAnswer, 'word');
        } else if (m === 'sentenceWordTranslation' || m === 'sentenceTranslationWord') {
            questionAnswer.splitted = sortArray(uniqueElements(questionAnswer.qAnswer.split(' '))) as string[];
        }

        return questionAnswer;
    }

    if (m !== 'random') {
        return handleQuestion(m, lessonData, currentQuestionNum);
    } else {
        const randomMode = getRandomMode(lessonType);
        return handleQuestion(randomMode, lessonData, currentQuestionNum);
    }
}

// function to get a random mode
const getRandomMode = (lessonType: string):string => {
    const allModes: string[] = lessonType === 'words'
        ? ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice'] 
        : ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord'];
    const randomIndex:number = Math.floor(Math.random()*allModes.length);
    return allModes[randomIndex];
}

// function to produce 4 MP choices + include 1 correct answer
export const fillMpChoiceArray = (data: WordTranslationArrayOfObj, correctAnswer:string, mpChoiceType: string): string[] => {  
    const mpChoices: string[] = data
        .map((el: WordTranslation, i: number): string => {
                let res: string = '';
                if (i<=2 && el[mpChoiceType] !== correctAnswer) {
                    res = el[mpChoiceType] as string;
                }

                return res;
            })
        .filter(el=>el);
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

export const mapModeNames = (v:string):string => {
    switch (v) {
        case 'wordTranslation':
            return 'Word - Translation'
        case 'translationWord':
            return 'Translation - Word'
        case 'wordTranslationMPChoice':
            return 'Multiple Choice: Word - Translation'
        case 'translationWordMPChoice':
            return 'Multiple Choice: Translation - Word'
        case 'sentenceWordTranslation':
            return 'Sentence: Word - Translation'
        case 'sentenceTranslationWord':
            return 'Sentence: Translation - Word'
        default:
            return 'All' // random mode returns All
    }
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