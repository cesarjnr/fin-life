import Logo from '../../components/logo';
import Button from '../../components/button';
import Input from '../../components/input/text-input';

export default function SignUp() {
  return (
    <div className="h-full flex justify-center items-center text-sm">
      <div className="bg-black-800 px-14 py-10 flex flex-col gap-20">
        <div className="text-center">
          <Logo fontSize="text-3xl mb-3" />
          <span className="font-semibold">
            Sua vida financeira em um só lugar
          </span>
        </div>
        <form className="flex flex-col gap-8">
          {/* <Input
            name="name"
            placeholder="Nome"
            type="text"
          />
          <Input
            name="email"
            placeholder="Email"
            type="text"
          />
          <Input
            isPassword={true}
            name="password"
            placeholder="Senha"
            type="text"
          /> */}
          <Button
            color="primary"
            label="Criar Conta"
            variant="contained"
          />
        </form>
        <div className="flex flex-col font-semibold text-center">
          <span>Já tem uma conta?</span>
          <a href="" className="text-green-500 hover:text-green-600">Entrar</a>
        </div>
      </div>
    </div>
  );
}
