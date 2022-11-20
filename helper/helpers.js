export const sortArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

export const getLesson = (m, lessonData) => {
    return sortArray(lessonData);
    // if (m === 'sentenceWordTranslation' || m === 'sentenceTranslationWord') {
    //     return sortArray(sentenceBuilderArr(lessonData));
    // } else {
    //     return sortArray(lessonData);
    // }
}

export const getQuestion = (m, lessonData, currentQuestionNum) => {

    const handleQuestion = (m, lessonData, currentQuestionNum) => {
        const questionAnswer = {};
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
            questionAnswer.splitted = sortArray(uniqueElements(questionAnswer.qAnswer.split(' ')));
        }

        console.log('questionAnswer', questionAnswer);
        return questionAnswer;
    }

    if (m !== 'random') {
        return handleQuestion(m, lessonData, currentQuestionNum);
    } else {
        const randomMode = getRandomMode();
        return handleQuestion(randomMode, lessonData, currentQuestionNum);
    }
}

// function to get a random mode
const getRandomMode = () => {
    const allModes = ['wordTranslation', 'translationWord', 'wordTranslationMPChoice', 'translationWordMPChoice', 'sentenceWordTranslation', 'sentenceTranslationWord'];
    const randomIndex = Math.floor(Math.random()*allModes.length);
    return allModes[randomIndex];
}

// function to procude 4 MP choices + include 1 correct answer
export const fillMpChoiceArray = (data, correctAnswer, mpChoiceType) => {
    const result = data.map((el,i) => i<=2 && el[mpChoiceType] !== correctAnswer && el[mpChoiceType]).filter(el=>el);
    result.push(correctAnswer);
    return sortArray(result);
}

export const isCorrect = (currentQuestion, answer) => {
    return answer.toLowerCase().trim() === currentQuestion.qAnswer.toLowerCase().trim();
}

// function outputs a lesson array for sentence-builder mode ONLY
// export const sentenceBuilderArr = (data) => {
//     return data.filter(el=>el.isSentense && el);
// }

// this function returns an array of letters that only repeat once
const uniqueElements = (array) => {
    return [...new Set(array)];
}
