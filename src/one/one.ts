
export const one = 1;

if (one !== 1) {
    console.log("Strange things happened comparing 1 === 1");
}



function getWeather(): Promise<any> {
    return Promise.resolve(1);
};
