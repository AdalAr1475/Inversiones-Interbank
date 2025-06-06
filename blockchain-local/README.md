# Instrucciones para uso:
- Este módulo permite desplegar un contrato y utilizar los servicios de firma y verificación del backend. No es necesario hacer cambios en el código mientras el contrato permanzca igual. Considerar que debe realizar esto cada vez que apague el servicio (este levanta un entorno temporal, por lo que los contratos desplegados son volátiles).

1. Abra dos terminales en paralelo para este módulo. En VSC, abra un terminal y seleccione la cruz (+), arriba a la derecha, para abrir una segunda terminal.
2. En la primera terminal, para levantar el servicio escriba: 
   
```shell
npx hardhat node
```
3. En la segunda terminal, para desplegar el contrato escriba: 
   
```shell
npx hardhat run scripts/deploy.js --network localhost
```
4. Regrese al backend y reinicie de ser necesario con: 
   
```shell
uvicorn main:app --reload
```