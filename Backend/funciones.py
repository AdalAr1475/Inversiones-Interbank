
def validar_ruc(ruc: str) -> bool:
    if len(ruc) != 11 or not ruc.isdigit():
        return False
    coef = [5,4,3,2,7,6,5,4,3,2]
    suma = sum(int(ruc[i]) * coef[i] for i in range(10))
    dig_verif = 11 - (suma % 11)
    if dig_verif == 10: dig_verif = 0
    elif dig_verif == 11: dig_verif = 1
    return dig_verif == int(ruc[10])

def validar_dni(dni: str) -> bool:
    """
    Verifica que el DNI tenga 8 caracteres y sean todos dígitos.
    """
    return len(dni) == 8 and dni.isdigit()

def validar_numero(numero: str) -> bool:
    # Verificar que el número sea un string de longitud 9 y que contenga solo dígitos
    if len(numero) == 9 and numero.isdigit():
        return True
    return False