/* Desafio Java Script:

Faça um programa para: Calcular com varáveis.

1 - Preço do combustível.
2- Gasto médio em combustível.
3- Distância em KM da viagem.

Imprima no console o valor gasto na viagem.
*/
const precoCombustivel = 5.79;
const kmPorLitro = 10;
const distanciaEmKm = 100;

const litrosConsumidos = distanciaEmKm / kmPorLitro;
const valorGasto = litrosConsumidos * precoCombustivel;


console.log(valorGasto.toFixed(2));


