export const GESTURES = ['dislike', 'like', 'rock', 'ok', 'peace', 'one', 'palm'];

export const GESTURE_IMAGES: { [key: string]: string } = {
    dislike: 'dislike.png',
    like: 'like.png',
    rock: 'rock.png',
    ok: 'ok.png',
    peace: 'peace.png',
    one: 'one.png',
    palm: 'palm.png',
};

export const SHAPE_IMAGES: { [key: string]: string } = {
    black_circle: 'black_circle.png',
    black_square: 'black_square.png',
    black_star: 'black_star.png',
    black_triangle: 'black_triangle.png',
    white_circle: 'white_circle.png',
    white_square: 'white_square.png',
    white_star: 'white_star.png',
    white_triangle: 'white_triangle.png',
};

export const shuffleGestures = (): string[] => {
    return GESTURES.sort(() => 0.5 - Math.random()).slice(0, 10);
};