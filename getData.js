import fm from 'front-matter'
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PdfReader } from "pdfreader";




//github-page : https://github.com/facebook/react-native-website/blob/main/docs/intro-react-native-components.md
//public url:   https://reactnative.dev/docs/intro-react-native-components
export const parseDocs = async (slug) => {
    const url = `https://raw.githubusercontent.com/facebook/react-native-website/refs/heads/main/docs/${slug}.md`;
    console.log(url)
    const response = await fetch(url);
    const content = await response.text();
    const data = fm(content)
    //console.log(data)
    return data;
}

export const fetchCustomData = async (slug) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    //console.log('fir', __dirname)
    const filePath = path.join(__dirname, 'food_delivery/md', `${slug}.md`);
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = fm(content);
        return data;
    } catch (error) {
        console.error('Error reading the file:', error);
        return null;
    }
};

export const fetchCustomDataPdf = async (slug) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const filePath = path.join(__dirname, 'food_delivery/pdf', `${slug}.pdf`);
    // console.log("file path pdf", filePath);

    try {
        const fileBuffer = await fs.readFile(filePath);
        const reader = new PdfReader();


        return new Promise((resolve, reject) => {
            let accumulatedText = "";

            reader.parseBuffer(fileBuffer, (err, item) => {
                if (err) {
                    reject("Error reading PDF: " + err);
                } else if (!item) {
                    //console.log("End of file.");
                    resolve(accumulatedText.replace(/[\u2022\u2023\u25E6\u2043\u2219\-•◦]/g, '').trim());
                } else if (item.text) {
                    accumulatedText += item.text + " ";
                }
            });
        });
    } catch (error) {
        console.error('Error reading the PDF file:', error);
        return null;
    }
};

