// 브라우저에 존재할 수 있다는 걸 인지하게 해주려고 만드는 global 객체
export { };
declare global {
    interface Window {
        ethereum?: any;
    }
}