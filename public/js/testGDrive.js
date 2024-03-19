import GDrive from './GDrive.js';
import { google } from 'googleapis';
import fs from 'fs';
import config from '../../config.json' assert { type: 'json' };

async function testGDrive() {
    const { client_id, client_secret, redirect_uri, refresh_token } = config.oauth2Credentials;
    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
    auth.setCredentials({ refresh_token });
    
    const gDrive = new GDrive(auth);

    const idCarpetaDrive = '1N3RNMxqqS708J03uatXP2U4lFDOQP2_E';

    console.log('Carpetas:');
    const carpetas = await gDrive.obtenerCarpetas(idCarpetaDrive);
    console.log(carpetas);

    console.log('Archivos:');
    const archivos = await gDrive.obtenerArchivos(idCarpetaDrive);
    console.log(archivos);

    const rutaLocal = '../eBooks/Harry Potter and the Cursed Child.epub';
    const tipusMIME = 'application/epub+zip';
    const nomArxiuDrive = 'Ejemploexample.epub';
    const nuevoArchivo = await gDrive.guardarArchivo(rutaLocal, tipusMIME, idCarpetaDrive, nomArxiuDrive);
    console.log('Nuevo archivo:');
    console.log(nuevoArchivo);

    const idArxiu = '19w9XceDETyYBDd1gwzyltp8Sy7cQj7j-mtIhfxgJmFY';
    await gDrive.borrarArchivo(idArxiu);
    console.log('Archivo borrado.');


    const nomCarpetaFilla = 'EjemploCarpetaFilla';
    const nuevaCarpeta = await gDrive.crearCarpeta(idCarpetaDrive, nomCarpetaFilla);
    console.log('Nueva carpeta:');
    console.log(nuevaCarpeta);
}

testGDrive().catch(console.error);