/// Allows you to fetch data from url
import fetch from 'node-fetch';


module.exports.data = async (url) => {
    return fetch(url)
        .then((response) => response.text())
        .then((data) => {
            return data;
        },);
}