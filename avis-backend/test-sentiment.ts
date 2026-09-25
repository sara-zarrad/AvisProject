import { pipeline } from "@huggingface/transformers";

async function test() {
    console.log("Chargement du modèle...");

    const classifier = await pipeline(
        "text-classification",
        "maximka608/multilingual-sentiment-analysis-ONNX"
    );

    console.log("Modèle chargé !");

    const avis = [
        "Le coach est excellent et la salle est magnifique.",
        "Le service est vraiment mauvais, je suis très déçu.",
        "La salle est correcte, rien de spécial.",
        "المدرب ممتاز والخدمة رائعة.",
        "الخدمة سيئة جدا وأنا غير راض."
    ];

    for (const texte of avis) {
        const result = await classifier(texte);

        console.log("\nAvis :", texte);
        console.log("Résultat :", result);
    }
}

test();